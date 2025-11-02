using System.Collections.ObjectModel;
using System.ComponentModel;
using System.Diagnostics;
using System.Runtime.CompilerServices;
using System.Threading;
using System.Windows.Input;
using TS.AppPages.CookbookApp.UiModels;
using TS.Engine.Abstractions;

namespace TS.AppPages.CookbookApp.ViewModels
{
    /// ViewModel לטאב "המתכונים שלי"
    public sealed class MyRecipesViewModel : INotifyPropertyChanged
    {
        private readonly string _userId;
        private readonly IRecipesService _svc;
        private readonly SemaphoreSlim _gate = new(1, 1);

        private bool _isBusy;
        public bool IsBusy
        {
            get => _isBusy;
            private set
            {
                if (_isBusy == value) return;
                _isBusy = value;
                OnPropertyChanged();
                (RefreshCommand as Command)?.ChangeCanExecute();
            }
        }

        public ObservableCollection<RecipeCard> Recipes { get; } = new();

        public ICommand RefreshCommand { get; }

        public event PropertyChangedEventHandler? PropertyChanged;

        public MyRecipesViewModel(string userId, IRecipesService svc)
        {
            _userId = userId;
            _svc = svc;

            RefreshCommand = new Command(
                execute: async () => await LoadAsync(),
                canExecute: () => !IsBusy
            );
        }

        public async Task LoadAsync(int take = 50, int skip = 0)
        {
            // מחסום נגד כניסות במקביל
            if (!await _gate.WaitAsync(0)) return;

            try
            {
                if (IsBusy) return;
                IsBusy = true;

                var list = await _svc.GetMyRecipesAsync(_userId, take, skip).ConfigureAwait(false);

                // עדכון אוסף על ה־UI Thread ולהמתין עד שיסתיים
                await MainThread.InvokeOnMainThreadAsync(() =>
                {
                    Recipes.Clear();

                    foreach (var r in list)
                    {
                        Recipes.Add(new RecipeCard(
                            recipeId: r.RecipeId,
                            title: r.Title,
                            prepMinutes: r.PrepMinutes,
                            totalMinutes: r.TotalMinutes,
                            imageUrl: string.IsNullOrWhiteSpace(r.ImageUrl)
                                ? "https://placehold.co/600x400?text=Recipe"
                                : r.ImageUrl
                        ));
                    }
                });
            }
            catch (Exception ex)
            {
                Debug.WriteLine($"MyRecipesViewModel.LoadAsync error: {ex}");
                // כאן אפשר להרים אירוע/MessageCenter או להחזיר תוצאה לשכבת ה־View לצורך הצגת הודעה
            }
            finally
            {
                IsBusy = false;
                _gate.Release();
            }
        }

        private void OnPropertyChanged([CallerMemberName] string? name = null)
            => PropertyChanged?.Invoke(this, new PropertyChangedEventArgs(name));
    }
}
