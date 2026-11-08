const createAccountForm =
    document.getElementById(
        "createAccountForm"
    );

const usernameInput =
    document.getElementById(
        "newUsername"
    );

const passwordInput =
    document.getElementById(
        "newPassword"
    );

const message =
    document.getElementById(
        "message"
    );

const backToLoginButton =
    document.getElementById(
        "backToLoginButton"
    );


// Create account
createAccountForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const username =
            usernameInput.value.trim();

        const password =
            passwordInput.value;


        // Required by rubric
        if (
            username === "" ||
            password === ""
        ) {

            alert(
                "Username and password cannot be empty."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    "/api/create-account",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body: JSON.stringify({
                            username: username,
                            password: password
                        })

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(data.message);

                return;
            }


            message.textContent =
                "Account created successfully!";


            /*
                Give the user a visible message
                and then send them back to login.
            */

            setTimeout(() => {

                window.location.href =
                    "index.html";

            }, 2000);


        } catch (error) {

            alert(
                "Unable to connect to the server."
            );

        }

    }
);


// Back to login
backToLoginButton.addEventListener(
    "click",
    () => {

        window.location.href =
            "index.html";

    }
);
