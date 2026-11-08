const accountSelect =
    document.getElementById("accountSelect");

const logoutButton =
    document.getElementById("logoutButton");


const recordAccountId =
    document.getElementById("recordAccountId");

const recordName =
    document.getElementById("recordName");

const recordColor =
    document.getElementById("recordColor");

const recordYear =
    document.getElementById("recordYear");

const recordRating =
    document.getElementById("recordRating");

const recordLanguage =
    document.getElementById("recordLanguage");

const recordComments =
    document.getElementById("recordComments");


// Helper for blank answers
function showValue(value) {

    if (
        value === undefined ||
        value === null ||
        value === ""
    ) {
        return "No response provided";
    }

    return value;
}


// Load account IDs
window.addEventListener(
    "load",
    async () => {

        try {

            const response =
                await fetch("/api/accounts");

            if (!response.ok) {

                window.location.href =
                    "index.html";

                return;
            }

            const accounts =
                await response.json();

            for (const account of accounts) {

                const option =
                    document.createElement(
                        "option"
                    );

                option.value =
                    account.accountId;

                option.textContent =
                    "Account ID " +
                    account.accountId;

                accountSelect.appendChild(
                    option
                );
            }

        } catch (error) {

            alert(
                "Unable to load account list."
            );
        }

    }
);


// When account ID changes
accountSelect.addEventListener(
    "change",
    async () => {

        const selectedId =
            accountSelect.value;

        if (selectedId === "") {
            return;
        }

        try {

            const response =
                await fetch(
                    "/api/account/" +
                    selectedId
                );

            const data =
                await response.json();

            if (!response.ok) {

                alert(data.message);
                return;
            }

            recordAccountId.textContent =
                showValue(data.accountId);

            recordName.textContent =
                showValue(data.name);

            recordColor.textContent =
                showValue(
                    data.favoriteColor
                );

            recordYear.textContent =
                showValue(data.year);

            recordRating.textContent =
                showValue(data.rating);

            recordLanguage.textContent =
                showValue(
                    data.favoriteLanguage
                );

            recordComments.textContent =
                showValue(data.comments);

        } catch (error) {

            alert(
                "Unable to load account data."
            );
        }

    }
);


// Logout
logoutButton.addEventListener(
    "click",
    async () => {

        try {

            await fetch(
                "/api/logout",
                {
                    method: "POST"
                }
            );

        } catch (error) {
            console.log(error);
        }

        window.location.href =
            "index.html";
    }
);
