const donatebtn = document.querySelectorAll(".amount-grid .Donate-button");
const frequencybtn = document.querySelectorAll(".frequency-grid .Donate-button");
const custombox = document.querySelector(".custom-amount-box");
const customInput = document.querySelector("#custom-amount");

const paymentBtns = document.querySelectorAll(".payment-btn");
const qrPanel = document.getElementById("qr-panel");
const bankPanel = document.getElementById("bank-panel");

const bankSelectBtn = document.getElementById("bank-select-btn");
const bankDropdown = document.getElementById("bank-dropdown");
const bankSelectLabel = document.getElementById("bank-select-label");

const bankDonateBtn = document.getElementById("bank-donate-btn");
const bankDonateHint = document.getElementById("bank-donate-hint");


//Shared state
let selectedAmount = null;
let selectedBank = null;

function updateDonateButtonState() {
    const ready = selectedBank && selectedAmount;
    bankDonateBtn.disabled = !ready;
    bankDonateHint.textContent = ready
        ? `Ready to donate RM ${selectedAmount} via ${selectedBank.name}`
        : "Select a bank and an amount to continue";
}

//Amount selection 
for (let i = 0; i < donatebtn.length; i++) {
    donatebtn[i].onclick = function (e) {
        for (let j = 0; j < donatebtn.length; j++) {
            donatebtn[j].classList.remove('active');
        }
        custombox.classList.remove('active');
        e.target.classList.add('active');

        selectedAmount = e.target.textContent.replace("RM ", "").trim();
        sessionStorage.setItem('savedAmount', selectedAmount);
        updateDonateButtonState();
    };
}

customInput.oninput = function () {
    selectedAmount = customInput.value || null;
    if(selectedAmount) sessionStorage.setItem('savedAmount', selectedAmount);
    updateDonateButtonState();
};

customInput.onfocus = function () {
    for (let j = 0; j < donatebtn.length; j++) {
        donatebtn[j].classList.remove('active');
    }
    custombox.classList.add('active');
};


//Frequency selection 
for (let i = 0; i < frequencybtn.length; i++) {
    frequencybtn[i].onclick = function (e) {
        for (let j = 0; j < frequencybtn.length; j++) {
            frequencybtn[j].classList.remove('active');
        }
        e.target.classList.add('active');
        sessionStorage.setItem('savedFrequency', e.target.textContent);
    };
}

//Payment method toggle 
for (let i = 0; i < paymentBtns.length; i++) {
    paymentBtns[i].onclick = function (e) {
        for (let j = 0; j < paymentBtns.length; j++) {
            paymentBtns[j].classList.remove("active");
        }
        e.currentTarget.classList.add("active");

        const method = e.currentTarget.dataset.method;
        qrPanel.hidden = method !== "qr";
        bankPanel.hidden = method !== "bank";
        sessionStorage.setItem('savedPaymentMethod', method);
    };
}

//Bank selector dropdown 
bankSelectBtn.onclick = function (e) {
    e.preventDefault(); // stops it acting like a form submit
    const isOpen = !bankDropdown.hidden;
    bankDropdown.hidden = isOpen;
    bankSelectBtn.classList.toggle("open", !isOpen);
};

// Choosing a bank just records the choice — it does NOT redirect yet
// Navigation only happens when Donate Now is clicked 
document.querySelectorAll(".bank-option").forEach(option => {
    option.addEventListener("click", (e) => {
        e.preventDefault();

        document.querySelectorAll(".bank-option").forEach(opt => {
            opt.classList.remove("selected");
        });
        option.classList.add("selected");

        selectedBank = {
            name: option.textContent.trim(),
            url: option.href
        };

        bankSelectLabel.textContent = selectedBank.name;
        bankDropdown.hidden = true;
        bankSelectBtn.classList.remove("open");
        sessionStorage.setItem('savedBankName', selectedBank.name);
        updateDonateButtonState();
    });
});

// Close the dropdown if the user clicks anywhere outside it
document.addEventListener("click", function (e) {
    if (!e.target.closest(".bank-select-wrapper")) {
        bankDropdown.hidden = true;
        bankSelectBtn.classList.remove("open");
    }
});


bankDonateBtn.onclick = function () {
    if (selectedBank && selectedAmount) {
        window.open(selectedBank.url, "_blank", "noopener,noreferrer");
    }
};

//Session Storage 
window.addEventListener('DOMContentLoaded', () => {      
    //Restore Payment Method
    const savedMethod = sessionStorage.getItem('savedPaymentMethod');
    if (savedMethod) {
        const methodBtn = Array.from(paymentBtns).find(btn => btn.dataset.method === savedMethod);
        if (methodBtn) methodBtn.click(); 
    }

    //Restore Frequency
    const savedFreq = sessionStorage.getItem('savedFrequency');
    if (savedFreq) {
        const freqBtn = Array.from(frequencybtn).find(btn => btn.textContent === savedFreq);
        if (freqBtn) freqBtn.click();}

    //Restore Amount
    const savedAmt = sessionStorage.getItem('savedAmount');
    if (savedAmt) {
        const amtBtn = Array.from(donatebtn).find(btn => btn.textContent.replace("RM ", "").trim() === savedAmt);
        if (amtBtn) {
            amtBtn.click();
        } else {
            // If no preset button matches, it must be a custom amount
            customInput.value = savedAmt;
            customInput.dispatchEvent(new Event('focus'));
            customInput.dispatchEvent(new Event('input'));}
    }

    //Restore Bank Selection
    const savedBankName = sessionStorage.getItem('savedBankName');
    if (savedBankName) {
        const bankOpts = Array.from(document.querySelectorAll('.bank-option'));
        const targetBank = bankOpts.find(opt => opt.textContent.trim() === savedBankName);
        if (targetBank) targetBank.click();
    }
});