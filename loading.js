document.addEventListener("DOMContentLoaded", function () {

    const loginLink = document.getElementById("login-link");
    const loadingScreen = document.getElementById("loading-screen");

    loginLink.addEventListener("click", function (e) {
        e.preventDefault();

        loadingScreen.classList.add("active");

        setTimeout(() => {
            window.location.href = "PageOne.html";
        }, 2000);
    });

});