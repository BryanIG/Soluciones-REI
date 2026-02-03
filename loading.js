const loginLink = document.getElementById("login-link");
const loadingScreen = document.getElementById("loading-screen");

loginLink.addEventListener("click", function (e) {
    e.preventDefault(); // evita irse directo al login

    // mostrar loading
    loadingScreen.classList.add("active");

    // esperar y redirigir
    setTimeout(() => {
        window.location.href = "login.html";
    }, 2000); // 2 segundos
});