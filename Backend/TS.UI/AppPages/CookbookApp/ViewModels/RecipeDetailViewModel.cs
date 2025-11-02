using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Runtime.CompilerServices;
using System.Diagnostics; // ← לוגים / Stopwatch
using TS.Engine.Abstractions;
using TS.Engine.Contracts;

namespace TS.AppPages.CookbookApp.ViewModels
{
    /// <summary>
    /// ViewModel למסך פרטי מתכון.
    /// טוען את הנתונים המלאים מהשירות (IRecipesService).
    /// </summary>
    public sealed class RecipeDetailViewModel : INotifyPropertyChanged
    {
        private readonly string _userId;
        private readonly string _recipeId;
        private readonly IRecipesService _svc;

        // ---- DEBUG ----
        private readonly string _logPrefix;
        private readonly bool _traceProps = false; // הפוך ל-true אם תרצי לראות כל שינוי מאפיין ביומן
        private void Log(string msg) =>
            Debug.WriteLine($"{DateTime.Now:HH:mm:ss.fff} [RecipeDetailVM] {_logPrefix} {msg}");
        // ---------------

        private bool _isBusy;
        private string _title = string.Empty;
        private string? _imageUrl;
        private int _prepMinutes;
        private int _totalMinutes;
        private int _servings = 1;
        private string? _notes;

        public event PropertyChangedEventHandler? PropertyChanged;

        public string Title
        {
            get => _title;
            private set { if (_title != value) { _title = value; OnPropertyChanged(); } }
        }

        public string? ImageUrl
        {
            get => _imageUrl;
            private set { if (_imageUrl != value) { _imageUrl = value; OnPropertyChanged(); } }
        }

        public int PrepMinutes
        {
            get => _prepMinutes;
            private set { if (_prepMinutes != value) { _prepMinutes = value; OnPropertyChanged(); } }
        }

        public int TotalMinutes
        {
            get => _totalMinutes;
            private set { if (_totalMinutes != value) { _totalMinutes = value; OnPropertyChanged(); } }
        }

        public int Servings
        {
            get => _servings;
            private set { if (_servings != value) { _servings = value; OnPropertyChanged(); } }
        }

        public string? Notes
        {
            get => _notes;
            private set { if (_notes != value) { _notes = value; OnPropertyChanged(); } }
        }

        public ObservableCollection<string> Ingredients { get; } = new();
        public ObservableCollection<string> Steps { get; } = new();

        public bool IsBusy
        {
            get => _isBusy;
            private set { if (_isBusy != value) { _isBusy = value; OnPropertyChanged(); } }
        }

        public RecipeDetailViewModel(string userId, string recipeId, IRecipesService svc)
        {
            _userId = userId;
            _recipeId = recipeId;
            _svc = svc;

            _logPrefix = $"user={_userId} recipe={_recipeId}";
            Log("ctor");
        }

        /// <summary>
        /// טוען את פרטי המתכון מהשירות ומעדכן את המאפיינים.
        /// </summary>
        public async Task LoadAsync()
        {
            if (IsBusy)
            {
                Log("LoadAsync: skipped (IsBusy=true)");
                return;
            }

            IsBusy = true;
            var sw = Stopwatch.StartNew();
            Log("LoadAsync: start");

            try
            {
                RecipeDetailDto r = await _svc.GetRecipeAsync(_userId, _recipeId);
                Log($"LoadAsync: dto received | Title='{r.Title}', Prep={r.PrepMinutes}, Total={r.TotalMinutes}, Servings={(r.Servings?.ToString() ?? "null")}, ImgNull={string.IsNullOrWhiteSpace(r.ImageUrl)}, " +
                    $"Ingredients={r.Ingredients?.Count ?? 0}, Steps={r.Steps?.Count ?? 0}");

                Title = r.Title ?? string.Empty;
                ImageUrl = string.IsNullOrWhiteSpace(r.ImageUrl)
                    ? "https://placehold.co/1200x800?text=Recipe"
                    : r.ImageUrl;

                PrepMinutes = r.PrepMinutes;
                TotalMinutes = r.TotalMinutes;
                Servings = r.Servings ?? 1;
                Notes = string.IsNullOrWhiteSpace(r.Notes) ? null : r.Notes.Trim();

                Ingredients.Clear();
                if (r.Ingredients is not null)
                {
                    foreach (var ing in r.Ingredients)
                    {
                        if (!string.IsNullOrWhiteSpace(ing.Text))
                            Ingredients.Add(ing.Text.Trim());
                    }
                }
                Log($"LoadAsync: Ingredients bound = {Ingredients.Count}");

                Steps.Clear();
                if (r.Steps is not null)
                {
                    foreach (var step in r.Steps)
                    {
                        if (!string.IsNullOrWhiteSpace(step.Text))
                            Steps.Add(step.Text.Trim());
                    }
                }
                Log($"LoadAsync: Steps bound = {Steps.Count}");
            }
            catch (Exception ex)
            {
                Log($"LoadAsync: ERROR {ex}");
            }
            finally
            {
                IsBusy = false;
                sw.Stop();
                Log($"LoadAsync: end in {sw.ElapsedMilliseconds} ms");
            }
        }

        private void OnPropertyChanged([CallerMemberName] string? name = null)
        {
            if (_traceProps)
                Log($"PropertyChanged: {name}");
            PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
        }
    }
}
