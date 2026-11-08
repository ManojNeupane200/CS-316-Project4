const loginForm =
    document.getElementById("loginForm");

const usernameInput =
    document.getElementById("username");

const passwordInput =
    document.getElementById("password");

const rememberCheckbox =
    document.getElementById("remember");

const createAccountButton =
    document.getElementById("createAccountButton");


// Load saved username and checkbox state
window.addEventListener("load", () => {

    const remember =
        localStorage.getItem("rememberUsername");

    const savedUsername =
        localStorage.getItem("savedUsername");

    if (remember === "true") {

        rememberCheckbox.checked = true;

        if (savedUsername) {
            usernameInput.value =
                savedUsername;
        }

    } else {

        rememberCheckbox.checked = false;
    }

});


// Login form
loginForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();

        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;

        try {

            const response =
                await fetch("/api/login", {

                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({
                        username: username,
                        password: password
                    })

                });

            const data =
                await response.json();


            // Save or remove remembered username
            if (rememberCheckbox.checked) {

                localStorage.setItem(
                    "rememberUsername",
                    "true"
                );

                localStorage.setItem(
                    "savedUsername",
                    username
                );

            } else {

                localStorage.setItem(
                    "rememberUsername",
                    "false"
                );

                localStorage.removeItem(
                    "savedUsername"
                );
            }


            if (!response.ok) {

                alert(data.message);
                return;
            }


            // Successful login
            window.location.href =
                "records.html";


        } catch (error) {

            alert(
                "Unable to connect to the server."
            );

        }

    }
);


// If checkbox is unchecked,
// stop remembering username
rememberCheckbox.addEventListener(
    "change",
    () => {

        if (!rememberCheckbox.checked) {

            localStorage.setItem(
                "rememberUsername",
                "false"
            );

            localStorage.removeItem(
                "savedUsername"
            );

        }

    }
);


// Go to Create Account page
createAccountButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "create.html";

    }
);
