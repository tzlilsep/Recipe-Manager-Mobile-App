// Backend/TS.Api/Features/ShoppingList/ShoppingListController.cs
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace TS.Api.Features.ShoppingList
{
    // This file only declares the controller meta (attributes + class).
    // Logic is organized in partial files.

    [ApiController]
    [Route("api/shopping")]
    [Authorize]
    public sealed partial class ShoppingListController : ControllerBase
    {
        // Intentionally empty — logic is in partial classes.
    }
}
