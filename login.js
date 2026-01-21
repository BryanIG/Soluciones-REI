const loginForm = document.getElementById("loginForm");
const registerForm = document.getElementById("registerForm");
const showRegister = document.getElementById("showRegister");
const backToLogin = document.getElementById("backToLogin");

showRegister.addEventListener("click", e => {
    e.preventDefault();
    loginForm.classList.add("animate__animated", "animate__fadeOut");

    setTimeout(() => {
        loginForm.style.display = "none";
        loginForm.classList.remove("animate__fadeOut");
        registerForm.style.display = "block";
        registerForm.classList.add("animate__animated", "animate__fadeIn");
    }, 500);
});

backToLogin.addEventListener("click", () => {
    registerForm.classList.add("animate__fadeOut");

    setTimeout(() => {
        registerForm.style.display = "none";
        registerForm.classList.remove("animate__fadeOut");
        loginForm.style.display = "block";
        loginForm.classList.add("animate__animated", "animate__fadeIn");
    }, 500);
});