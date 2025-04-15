// Funkce pro obsluhu kliknutí na tlačítko
function handleButtonClick() {
    alert('Tlačítko bylo kliknuto!');
}

// Přidání posluchače události na tlačítko
document.addEventListener('DOMContentLoaded', () => {
    const button = document.querySelector('button'); // Najde první tlačítko na stránce
    if (button) {
        button.addEventListener('click', handleButtonClick);
    }
});