$(function () {
    const SDG_API_URL = "https://unstats.un.org/SDGAPI/v1/sdg/Goal/List?includechildren=false";
    const selectedGoals = ["7", "9", "11", "12", "13"];
    const goalMeta = {
        "7": { shortTitle: "Clean Energy", colour: "#fbc412", connection: "Renewable energy and energy efficiency" },
        "9": { shortTitle: "Innovation", colour: "#f36d25", connection: "Responsible technology and sustainable innovation" },
        "11": { shortTitle: "Sustainable Cities", colour: "#f99d26", connection: "Smart, inclusive and resilient communities" },
        "12": { shortTitle: "Responsible Consumption", colour: "#bf8b2e", connection: "Recycling and responsible resource use" },
        "13": { shortTitle: "Climate Action", colour: "#3f7e44", connection: "Environmental awareness and practical action" }
    };
    const fallbackGoals = [
        { code: "7", title: "Ensure access to affordable, reliable, sustainable and modern energy for all", description: "Goal 7 promotes broader energy access, renewable energy, clean-energy technology and improved energy efficiency." },
        { code: "9", title: "Build resilient infrastructure, promote inclusive and sustainable industrialization and foster innovation", description: "Goal 9 connects infrastructure, responsible industrial development, research and innovation." },
        { code: "11", title: "Make cities and human settlements inclusive, safe, resilient and sustainable", description: "Goal 11 encourages better-planned communities that support safety, resilience, inclusion and innovation." },
        { code: "12", title: "Ensure sustainable consumption and production patterns", description: "Goal 12 promotes responsible material use, waste reduction and safer management of environmentally harmful materials." },
        { code: "13", title: "Take urgent action to combat climate change and its impacts", description: "Goal 13 calls for climate action and stronger resilience to climate-related hazards and environmental challenges." }
    ];

    function setStatus(type, icon, message) {
        $("#goalSource")
            .removeClass("success warning")
            .addClass(type)
            .empty()
            .append($("<i>").addClass(icon).attr("aria-hidden", "true"))
            .append($("<span>").text(message));
    }

    function showGoal(goal) {
        $("#goalDescriptionLabel").text("UN Sustainable Development Goal " + goal.code);
        $("#goalDescriptionTitle").text(goal.title);
        $("#goalDescriptionText").text(goal.description);
        $("#goalDescription").prop("hidden", false).trigger("focus");
    }

    function renderGoals(goals) {
        const $grid = $("#goalList").empty();

        goals.forEach(function (goal) {
            const meta = goalMeta[goal.code];
            if (!meta) return;

            const $button = $("<button>", {
                type: "button",
                class: "goal-tile",
                "aria-label": "Read the full description for Sustainable Development Goal " + goal.code
            }).css("--goal-colour", meta.colour);

            const $top = $("<div>", { class: "goal-tile-heading" })
                .append($("<span>", { class: "goal-number", text: goal.code }))
                .append($("<h3>").text("SDG " + goal.code + " · " + meta.shortTitle));

            $button.append($top).append($("<p>").text(meta.connection));
            $button.on("click", function () { showGoal(goal); });

            $("<div>", { class: "col-md-6 col-xl" }).append($button).appendTo($grid);
        });
    }

    $.ajax({
        url: SDG_API_URL,
        method: "GET",
        dataType: "json",
        timeout: 12000
    }).done(function (response) {
        const goals = response.filter(function (goal) {
            return selectedGoals.includes(String(goal.code));
        }).map(function (goal) {
            return {
                code: String(goal.code),
                title: goal.title,
                description: goal.description
            };
        });

        renderGoals(goals);
        setStatus("success", "fa-solid fa-circle-check", "Source: United Nations Sustainable Development Goals");
    }).fail(function () {
        renderGoals(fallbackGoals);
        setStatus("warning", "fa-solid fa-triangle-exclamation", "The live API is unavailable, so saved reference content is shown instead.");
    });
});