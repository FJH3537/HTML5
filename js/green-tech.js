document.addEventListener("DOMContentLoaded", () => {
    const SAVE_KEY = "greenTechFaqQuestions", OPEN_KEY = "greenTechOpenFaq";
    const byId = id => document.getElementById(id);
    const form = byId("questionForm"), input = byId("questionInput");
    const counter = byId("characterCount"), messageBox = byId("formMessage");
    const list = byId("questionList"), count = byId("questionCount");
    const empty = byId("emptyQuestionList"), clearButton = byId("clearQuestionsButton");

    const read = () => {
        try {
            const data = JSON.parse(localStorage.getItem(SAVE_KEY) || "[]");
            return Array.isArray(data) ? data : [];
        } catch { return []; }
    };
    const write = questions => localStorage.setItem(SAVE_KEY, JSON.stringify(questions));
    const notify = (type, text) => {
        messageBox.className = `form-message ${type}`;
        messageBox.textContent = text;
    };
    const make = (tag, className = "") => {
        const element = document.createElement(tag);
        if (className) element.className = className;
        return element;
    };

    const render = () => {
        const questions = read();
        list.replaceChildren();
        count.textContent = questions.length;
        empty.hidden = questions.length > 0;
        clearButton.hidden = questions.length === 0;

        questions.forEach(item => {
            const row = make("li", "question-entry"), content = make("div");
            const text = make("p"), time = make("time");
            text.textContent = item.question;
            time.dateTime = item.submittedAt;
            time.textContent = `Submitted ${new Date(item.submittedAt).toLocaleString()}`;
            content.append(text, time);

            const remove = make("button", "remove-question");
            remove.type = "button";
            remove.setAttribute("aria-label", "Remove this submitted question");
            remove.innerHTML = '<i class="fa-solid fa-trash-can" aria-hidden="true"></i>';
            remove.onclick = () => {
                write(read().filter(question => question.id !== item.id));
                render();
                notify("success", "Question removed.");
            };
            row.append(content, remove);
            list.appendChild(row);
        });
    };

    input.oninput = () => counter.textContent = `${input.value.length} / 500`;
    form.onsubmit = event => {
        event.preventDefault();
        form.classList.add("was-validated");
        if (!form.checkValidity()) return;

        const questions = read();
        questions.unshift({ id: Date.now().toString(), question: input.value.trim(), submittedAt: new Date().toISOString() });
        try {
            write(questions);
            form.reset();
            form.classList.remove("was-validated");
            counter.textContent = "0 / 500";
            render();
            notify("success", "Thank you! Your question has been submitted.");
        } catch { notify("error", "We could not submit your question. Please try again."); }
    };

    clearButton.onclick = () => {
        if (!confirm("Remove all submitted questions?")) return;
        localStorage.removeItem(SAVE_KEY);
        render();
        notify("success", "All submitted questions were removed.");
    };

    document.querySelectorAll("#greenQuestions .accordion-collapse").forEach(item =>
        item.addEventListener("shown.bs.collapse", () => sessionStorage.setItem(OPEN_KEY, item.id))
    );
    const openAnswer = byId(sessionStorage.getItem(OPEN_KEY));
    if (openAnswer && !openAnswer.classList.contains("show"))
        bootstrap.Collapse.getOrCreateInstance(openAnswer, { toggle: false }).show();
    render();
});