// MyApp\Backend\TS.AWS\Services\AwsShoppingListService.cs 
using Amazon.DynamoDBv2;
using Amazon.DynamoDBv2.Model;
using TS.AWS.Factories;
using TS.Engine.Abstractions;
using TS.Engine.Contracts;

namespace TS.AWS.Services;

public sealed class AwsShoppingListService : IShoppingListService
{
    private readonly IAmazonDynamoDB _ddb;
    private const string TableName = "AppData";

    public AwsShoppingListService(string idToken)
    {
        _ddb = AwsClientsFactory.CreateDynamoDbFromIdToken(idToken);
    }

    // Returns list headers with up to 'take' items
    public async Task<IReadOnlyList<ShoppingListDto>> GetListsAsync(string userId, int take)
    {
        // 1) Fetch all list headers (LIST#)
        var headersResp = await _ddb.QueryAsync(new QueryRequest
        {
            TableName = TableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues = new()
            {
                [":pk"] = new AttributeValue($"USER#{userId}"),
                [":sk"] = new AttributeValue("LIST#")
            },
            ProjectionExpression = "PK, SK, #T, ListName, ListOrder",
            ExpressionAttributeNames = new()
            {
                ["#T"] = "Type"
            }
        });

        var headers = headersResp.Items
            .Where(i => i.TryGetValue("Type", out var t) && t.S == "List")
            .Select(i => new
            {
                ListId = i["SK"].S.Replace("LIST#", string.Empty),
                Name   = i.TryGetValue("ListName", out var n) ? n.S : "רשימה",
                Order  = i.TryGetValue("ListOrder", out var o) && !string.IsNullOrWhiteSpace(o.N)
                            ? int.Parse(o.N)
                            : int.MaxValue // לישנות ללא Order נשים גבוה כדי שיזדנבו לסוף
            })
            .OrderBy(h => h.Order)
            .ToList();

        // 2) For each list, fetch up to 'take' items (ordered by SK)
        var results = new List<ShoppingListDto>(headers.Count);

        foreach (var h in headers)
        {
            var items = new List<ShoppingListItemDto>();

            if (take > 0)
            {
                var itemsResp = await _ddb.QueryAsync(new QueryRequest
                {
                    TableName = TableName,
                    KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)",
                    ExpressionAttributeValues = new()
                    {
                        [":pk"] = new AttributeValue($"USER#{userId}"),
                        [":sk"] = new AttributeValue($"LIST#{h.ListId}#ITEM#")
                    },
                    ExpressionAttributeNames = new()
                    {
                        ["#T"] = "Text",
                        ["#C"] = "IsChecked"
                    },
                    ProjectionExpression = "SK, #T, #C",
                    Limit = take,
                    ScanIndexForward = true // ascending by SK
                });

                foreach (var av in itemsResp.Items)
                {
                    var text = av.TryGetValue("Text", out var txt) ? txt.S : "";
                    var isChecked = av.TryGetValue("IsChecked", out var chk) && (chk.BOOL ?? false);
                    var sk = av.TryGetValue("SK", out var skVal) ? skVal.S : "";
                    var id = ExtractItemIdFromSk(sk);

                    if (!string.IsNullOrWhiteSpace(text) && !string.IsNullOrWhiteSpace(id))
                    {
                        items.Add(new ShoppingListItemDto
                        {
                            Id = id,
                            Name = text,
                            Checked = isChecked
                        });
                    }
                }
            }

            results.Add(new ShoppingListDto
            {
                UserId = userId,
                ListId = h.ListId,
                Name   = h.Name,
                Items  = items,
                Order  = h.Order == int.MaxValue ? results.Count : h.Order // fallback סביר
            });
        }

        // ליתר ביטחון — מחזירים ממוין
        return results.OrderBy(r => r.Order).ToList();
    }

    // יצירה עם תמיכה ב-order (אם לא נשלח — להצמיד לסוף)
    public async Task CreateListAsync(string userId, string listId, string name, int? order = null)
    {
        var finalOrder = order ?? await ComputeNextOrder(userId);

        // Conditional put to avoid overwriting an existing list
        await _ddb.PutItemAsync(new PutItemRequest
        {
            TableName = TableName,
            Item = new()
            {
                ["PK"]        = new AttributeValue($"USER#{userId}"),
                ["SK"]        = new AttributeValue($"LIST#{listId}"),
                ["Type"]      = new AttributeValue("List"),
                ["ListName"]  = new AttributeValue(name),
                ["ListOrder"] = new AttributeValue { N = finalOrder.ToString() },
                ["UpdatedAt"] = new AttributeValue(DateTime.UtcNow.ToString("o"))
            },
            ConditionExpression = "attribute_not_exists(PK) AND attribute_not_exists(SK)"
        });
    }

    public async Task DeleteListAsync(string userId, string listId)
    {
        // Delete all rows under the list (header + items)
        var q = await _ddb.QueryAsync(new QueryRequest
        {
            TableName = TableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues = new()
            {
                [":pk"] = new AttributeValue($"USER#{userId}"),
                [":sk"] = new AttributeValue($"LIST#{listId}")
            },
            ProjectionExpression = "PK, SK"
        });

        var batch = new List<WriteRequest>();
        foreach (var it in q.Items)
        {
            batch.Add(new WriteRequest(new DeleteRequest(new()
            {
                ["PK"] = it["PK"],
                ["SK"] = it["SK"]
            })));

            if (batch.Count == 25)
            {
                await _ddb.BatchWriteItemAsync(new BatchWriteItemRequest { RequestItems = new() { [TableName] = batch } });
                batch.Clear();
            }
        }
        if (batch.Count > 0)
            await _ddb.BatchWriteItemAsync(new BatchWriteItemRequest { RequestItems = new() { [TableName] = batch } });
    }

    // Loads a single list with all items (כולל Order מה-Header)
    public async Task<ShoppingListDto> LoadAsync(string userId, string listId)
    {
        var resp = await _ddb.QueryAsync(new QueryRequest
        {
            TableName = TableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues = new()
            {
                [":pk"] = new AttributeValue($"USER#{userId}"),
                [":sk"] = new AttributeValue($"LIST#{listId}")
            }
        });

        var name = "רשימה";
        var items = new List<ShoppingListItemDto>();
        var order = int.MaxValue;

        foreach (var av in resp.Items)
        {
            if (!av.TryGetValue("Type", out var t)) continue;

            if (t.S == "List")
            {
                name  = av.TryGetValue("ListName", out var n) ? n.S : name;
                order = av.TryGetValue("ListOrder", out var o) && !string.IsNullOrWhiteSpace(o.N)
                    ? int.Parse(o.N) : order;
            }
            else if (t.S == "ListItem")
            {
                var text = av.TryGetValue("Text", out var txt) ? txt.S : "";
                var isChecked = av.TryGetValue("IsChecked", out var chk) && (chk.BOOL ?? false);
                var sk = av.TryGetValue("SK", out var skVal) ? skVal.S : "";
                var id = ExtractItemIdFromSk(sk);

                if (!string.IsNullOrWhiteSpace(text) && !string.IsNullOrWhiteSpace(id))
                {
                    items.Add(new ShoppingListItemDto
                    {
                        Id = id,
                        Name = text,
                        Checked = isChecked
                    });
                }
            }
        }

        // אם עדיין אין Order (רשימות ישנות) — נצמיד לסוף
        if (order == int.MaxValue)
            order = await ComputeNextOrder(userId);

        return new ShoppingListDto
        {
            UserId = userId,
            ListId = listId,
            Name   = name,
            Items  = items,
            Order  = order
        };
    }

    public async Task SaveAsync(ShoppingListDto list)
    {
        // Delete existing items for this list
        var existing = await _ddb.QueryAsync(new QueryRequest
        {
            TableName = TableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues = new()
            {
                [":pk"] = new AttributeValue($"USER#{list.UserId}"),
                [":sk"] = new AttributeValue($"LIST#{list.ListId}#ITEM#")
            },
            ProjectionExpression = "PK, SK"
        });

        var deletes = existing.Items.Select(it =>
            new WriteRequest(new DeleteRequest(new()
            {
                ["PK"] = it["PK"],
                ["SK"] = it["SK"]
            }))).ToList();

        foreach (var chunk in Chunk(deletes, 25))
            await _ddb.BatchWriteItemAsync(new BatchWriteItemRequest { RequestItems = new() { [TableName] = chunk } });

        // Upsert list header (כולל Order)
        await _ddb.PutItemAsync(new PutItemRequest
        {
            TableName = TableName,
            Item = new()
            {
                ["PK"]        = new AttributeValue($"USER#{list.UserId}"),
                ["SK"]        = new AttributeValue($"LIST#{list.ListId}"),
                ["Type"]      = new AttributeValue("List"),
                ["ListName"]  = new AttributeValue(list.Name),
                ["ListOrder"] = new AttributeValue { N = list.Order.ToString() },
                ["UpdatedAt"] = new AttributeValue(DateTime.UtcNow.ToString("o"))
            }
        });

        // Insert items with ordered SK (zero-padded index)
        var puts = new List<WriteRequest>();
        for (int i = 0; i < list.Items.Count; i++)
        {
            var it = list.Items[i];
            if (string.IsNullOrWhiteSpace(it.Name)) continue;

            var itemSkSuffix = i.ToString("D4");

            puts.Add(new WriteRequest(new PutRequest(new()
            {
                ["PK"]        = new AttributeValue($"USER#{list.UserId}"),
                ["SK"]        = new AttributeValue($"LIST#{list.ListId}#ITEM#{itemSkSuffix}"),
                ["Type"]      = new AttributeValue("ListItem"),
                ["Text"]      = new AttributeValue(it.Name),
                ["IsChecked"] = new AttributeValue { BOOL = it.Checked }
            })));

            if (puts.Count == 25)
            {
                await _ddb.BatchWriteItemAsync(new BatchWriteItemRequest { RequestItems = new() { [TableName] = puts } });
                puts.Clear();
            }
        }
        if (puts.Count > 0)
            await _ddb.BatchWriteItemAsync(new BatchWriteItemRequest { RequestItems = new() { [TableName] = puts } });
    }

    private static string ExtractItemIdFromSk(string sk)
    {
        // "LIST#<listId>#ITEM#0007" -> "0007"
        const string marker = "#ITEM#";
        var idx = sk.LastIndexOf(marker, StringComparison.Ordinal);
        return idx >= 0 && idx + marker.Length < sk.Length
            ? sk.Substring(idx + marker.Length)
            : string.Empty;
    }

    // Utility: chunk a sequence into batches
    private static IEnumerable<List<T>> Chunk<T>(IEnumerable<T> src, int size)
    {
        var buf = new List<T>(size);
        foreach (var x in src)
        {
            buf.Add(x);
            if (buf.Count == size) { yield return buf; buf = new(size); }
        }
        if (buf.Count > 0) yield return buf;
    }

    // מחשב next order ע"י סריקת כל ה-headers ומציאת המקסימום
    private async Task<int> ComputeNextOrder(string userId)
    {
        var headersResp = await _ddb.QueryAsync(new QueryRequest
        {
            TableName = TableName,
            KeyConditionExpression = "PK = :pk AND begins_with(SK, :sk)",
            ExpressionAttributeValues = new()
            {
                [":pk"] = new AttributeValue($"USER#{userId}"),
                [":sk"] = new AttributeValue("LIST#")
            },
            ProjectionExpression = "SK, #T, ListOrder",
            ExpressionAttributeNames = new()
            {
                ["#T"] = "Type"
            }
        });

        int max = -1;
        foreach (var i in headersResp.Items.Where(i => i.TryGetValue("Type", out var t) && t.S == "List"))
        {
            if (i.TryGetValue("ListOrder", out var o) && !string.IsNullOrWhiteSpace(o.N))
            {
                if (int.TryParse(o.N, out var v) && v > max) max = v;
            }
            else
            {
                // אם אין Order – נתייחס כאל "בסוף" באמצעות אינדקס זמני
                max = Math.Max(max, 0);
            }
        }
        return max + 1;
    }
}
