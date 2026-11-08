const surveyForm =
    document.getElementById("surveyForm");

const nameInput =
    document.getElementById("name");

const favoriteColorInput =
    document.getElementById("favoriteColor");

const ratingInput =
    document.getElementById("rating");

const ratingValue =
    document.getElementById("ratingValue");

const favoriteLanguageInput =
    document.getElementById("favoriteLanguage");

const commentsInput =
    document.getElementById("comments");

const formMessage =
    document.getElementById("formMessage");


// Show the slider value
ratingInput.addEventListener(
    "input",
    () => {

        ratingValue.textContent =
            ratingInput.value;

    }
);


// Load previous form data
window.addEventListener(
    "load",
    async () => {

        try {

            const response =
                await fetch("/api/my-form");

            if (!response.ok) {

                window.location.href =
                    "index.html";

                return;
            }

            const data =
                await response.json();


            nameInput.value =
                data.name || "";

            favoriteColorInput.value =
                data.favoriteColor || "";

            favoriteLanguageInput.value =
                data.favoriteLanguage || "";

            commentsInput.value =
                data.comments || "";


            if (data.rating) {

                ratingInput.value =
                    data.rating;

                ratingValue.textContent =
                    data.rating;
            }


            if (data.year) {

                const selectedYear =
                    document.querySelector(
                        `input[name="year"][value="${data.year}"]`
                    );

                if (selectedYear) {

                    selectedYear.checked =
                        true;
                }

            }

        } catch (error) {

            alert(
                "Could not load your saved data."
            );

        }

    }
);


// Save form data
surveyForm.addEventListener(
    "submit",
    async (event) => {

        event.preventDefault();


        const selectedYear =
            document.querySelector(
                'input[name="year"]:checked'
            );


        const formData = {

            name:
                nameInput.value.trim(),

            favoriteColor:
                favoriteColorInput.value,

            year:
                selectedYear
                    ? selectedYear.value
                    : "",

            rating:
                ratingInput.value,

            favoriteLanguage:
                favoriteLanguageInput.value.trim(),

            comments:
                commentsInput.value.trim()

        };


        try {

            const response =
                await fetch(
                    "/api/my-form",
                    {

                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json"
                        },

                        body:
                            JSON.stringify(
                                formData
                            )

                    }
                );


            const data =
                await response.json();


            if (!response.ok) {

                alert(data.message);
                return;
            }


            formMessage.textContent =
                "Survey saved successfully!";


        } catch (error) {

            alert(
                "Unable to save your survey."
            );

        }

    }
);
