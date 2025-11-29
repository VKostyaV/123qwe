//****************************************************************
// Rules
//****************************************************************
const nameRules = [
    v => v.length >= 3 ? null : 'Name must be at least 3 characters',
    v => v.length <= 20 ? null : 'Name must be at most 20 characters',
    v => /^[A-Za-zА-Яа-яЁё0-9 _-]+$/.test(v) ? null : 'Allowed chars: letters, numbers, space, -, _'
];

const emailRules = [
    v => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v) ? null : 'Invalid email format'
];

const passwordRules = [
    v => v.length >= 8 ? null : 'Min 8 characters',
    v => /[A-Z]/.test(v) ? null : 'Need 1 uppercase letter',
    v => /[a-z]/.test(v) ? null : 'Need 1 lowercase letter',
    v => /[0-9]/.test(v) ? null : 'Need 1 digit',
    v => /[!@#$%^&*]/.test(v) ? null : 'Need 1 special char (!@#$%^&*)'
];

//****************************************************************
// Helpers
//****************************************************************
function runRules(value, rules) {
    const errors = [];
    if (!value) {
        return ['Field is required'];
    }
    for (const rule of rules) {
        const res = rule(value);
        if (res) errors.push(res);
    }
    return errors;
}

function showErrors(container, errors) {
    if (!errors.length) {
        container.innerHTML = '<div class="ok" style="color:green;font-size:13px;">Looks good</div>';
    } else {
        container.innerHTML = `<ul><li>${errors[0]}</li></ul>`;
    }
}

//****************************************************************
// Elements
//****************************************************************
const form = document.getElementById('regForm');
const inputName = document.getElementById('name');
const inputEmail = document.getElementById('email');
const inputPass = document.getElementById('password');

const nameErrorsDiv = document.getElementById('nameErrors');
const emailErrorsDiv = document.getElementById('emailErrors');
const passErrorsDiv = document.getElementById('passwordErrors');

const submitBtn = document.getElementById('submitBtn');
const statusDiv = document.getElementById('status');

//****************************************************************
// Validation Logic
//****************************************************************
function validateAll() {
    const nameVal = inputName.value.trim();
    const emailVal = inputEmail.value.trim();
    const passVal = inputPass.value;

    const nameErrs = runRules(nameVal, nameRules);
    const emailErrs = runRules(emailVal, emailRules);
    const passErrs = runRules(passVal, passwordRules);

    if (inputName.value || nameErrs.length === 0) showErrors(nameErrorsDiv, nameErrs);
    if (inputEmail.value || emailErrs.length === 0) showErrors(emailErrorsDiv, emailErrs);
    if (inputPass.value || passErrs.length === 0) showErrors(passErrorsDiv, passErrs);

    if (!nameVal) nameErrorsDiv.innerHTML = '';
    if (!emailVal) emailErrorsDiv.innerHTML = '';
    if (!passVal) passErrorsDiv.innerHTML = '';

    const ok = nameErrs.length === 0 && emailErrs.length === 0 && passErrs.length === 0;

    submitBtn.disabled = !ok;

    return { ok, nameVal, emailVal, passVal };
}

inputName.addEventListener('input', validateAll);
inputEmail.addEventListener('input', validateAll);
inputPass.addEventListener('input', validateAll);

validateAll();

//****************************************************************
// SEND DATA TO SERVER
//****************************************************************
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    statusDiv.textContent = '';

    const { ok, nameVal, passVal, emailVal } = validateAll();

    if (!ok) {
        statusDiv.textContent = 'Fix errors before submitting.';
        statusDiv.style.color = 'red';
        return;
    }

    const payload = {
        name: nameVal,
        email: emailVal,
        password: passVal
    };

    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    try {
        // from register.html (path: /site/register/register.html) to api: ../api/register.php
        const res = await fetch('../api/register.php', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // If server returned non-2xx, try to parse the JSON error
        let data = null;
        try { data = await res.json(); } catch (e) { /* ignore invalid json */ }

        if (!res.ok) {
            const msg = (data && data.error) ? data.error : `HTTP error! Status: ${res.status}`;
            throw new Error(msg);
        }

        if (data && data.error) {
            statusDiv.style.color = 'red';
            statusDiv.textContent = data.error;
            submitBtn.disabled = false;
            submitBtn.textContent = 'Register';
        } else {
            statusDiv.style.color = 'green';
            statusDiv.textContent = data && data.message ? data.message : 'Registered successfully';

            form.reset();
            nameErrorsDiv.innerHTML = '';
            emailErrorsDiv.innerHTML = '';
            passErrorsDiv.innerHTML = '';

            validateAll();
            submitBtn.textContent = 'Register';
        }

    } catch (err) {
        statusDiv.style.color = 'red';
        statusDiv.textContent = 'Network error: ' + err.message + '. Check the API path.';
        submitBtn.disabled = false;
        submitBtn.textContent = 'Register';
        console.error('Registration error:', err);
    }
});
