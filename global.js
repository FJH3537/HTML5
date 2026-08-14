document.addEventListener("DOMContentLoaded", () => {
    loadPartial("nav-placeholder", "navbar.html");
    loadPartial("footer-placeholder", "footer.html");
});

async function loadPartial(elementId, url) {
    const target = document.getElementById(elementId);
    if (!target) return;

    try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`${url} failed: ${res.status}`);
        target.innerHTML = await res.text();
    } catch (error) {
        console.error(error);
    }
}
