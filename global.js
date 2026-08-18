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

//added below (cookies)
$(document).ready(function () {
    function setCookie(cname, cvalue, exdays) {
        const d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        const expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }

    function getCookie(cname) {
        const name = cname + "=";
        const decodedCookie = decodeURIComponent(document.cookie);
        const ca = decodedCookie.split(';');
        for (let i = 0; i < ca.length; i++) {
            let c = ca[i].trim();
            if (c.indexOf(name) === 0) return c.substring(name.length, c.length);
        }
        return "";
    }

    const currentConsent = getCookie("gt_cookie_consent");
    
    if (currentConsent === "") {
        const cookieBannerHTML = `
            <div id="cookie-banner" class="card shadow-lg border-0 fixed-bottom m-3 m-md-4 p-2.5 cookie-slide-in" 
                 style="z-index: 1050; max-width: 375px; background-color: #ffffff; border-radius: 14px; border-left: 5px solid #2d6a4f !important;">
                <div class="card-body p-2">
                    <div class="d-flex align-items-center mb-2">
                        <div class="bg-light p-2 rounded-circle me-2.5 text-success d-flex align-items-center justify-content-center" style="width: 36px; height: 36px;">
                            <i class="fa-solid fa-cookie-bite fs-5" style="color: #2d6a4f;"></i>
                        </div>
                        <div>
                            <h6 class="fw-bold mb-0" style="color: #2d6a4f; font-size: 0.95rem;">Cookie Preferences</h6>
                        </div>
                    </div>
                    <p class="text-muted mb-2" style="font-size: 0.9rem; line-height: 1.35;">
                        We use cookies to improve your browsing experience.
                    </p>
                    <div class="d-flex justify-content-end gap-2 mt-2">
                        <button id="deny-cookie-btn" class="btn btn-sm btn-outline-secondary px-3 py-1 rounded-pill" style="font-size: 0.78rem;">
                            Decline
                        </button>
                        <button id="accept-cookie-btn" class="btn btn-sm text-white px-4 py-1 rounded-pill" style="background-color: #2d6a4f; font-size: 0.78rem;">
                            Accept
                        </button>
                    </div>
                </div>
            </div>
        `;
        $('body').append(cookieBannerHTML);
    }

    $(document).on('click', '#accept-cookie-btn', function () {
        setCookie("gt_cookie_consent", "accepted", 7);
        
        const banner = $('#cookie-banner');
        banner.addClass('cookie-slide-out');
        setTimeout(function() {
            banner.remove();
        }, 800);
    });

    $(document).on('click', '#deny-cookie-btn', function () {
        setCookie("gt_cookie_consent", "denied", 7);
        
        const banner = $('#cookie-banner');
        banner.addClass('cookie-slide-out');
        setTimeout(function() {
            banner.remove();
        }, 800);
    });
});

