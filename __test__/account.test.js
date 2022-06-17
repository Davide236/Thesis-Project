const {checkValidPassword,
    openPasswordForm, 
    closePasswordForm,
    showPassword} = require('../public/js/Account.js');


describe('Testing the DOM manipulation of Account.js', () => {

    beforeEach(() => {
        document.body.innerHTML = `
        <div class="form-group">
        <label>Password</label>
        <input type="password" pattern="(?=^.{8,}$)((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$" class="form-control register-input" name="password" placeholder="password" id="passwordSign"
        required>
        <i class="far fa-eye passwordEye" id="signEye" onclick="showPassword('signup')"></i>
        <div id="feedback"></div>
        </div>
        <div class="form-popup" id="passwordForm"></div>
        `;
    });

    it('Check password control invalid', () => {
        let feedback = document.getElementById('feedback');
        checkValidPassword('Experiment');
        expect(feedback.style.color).toBe('red');
    });

    it('Check password control valid', () => {
        let feedback = document.getElementById('feedback');
        checkValidPassword('Experiment1');
        expect(feedback.style.color).toBe('rgb(9, 158, 41)');
    });

    it('Closes password form', () => {
        let passwordForm = document.getElementById('passwordForm');
        passwordForm.style.display = 'block';
        closePasswordForm();
        expect(passwordForm.style.display).toBe('none');
    });

    it('Open password form', () => {
        let passwordForm = document.getElementById('passwordForm');
        openPasswordForm();
        expect(passwordForm.style.display).toBe('block');
    });

    it('Show password', () => {
        let password = document.getElementById('passwordSign');
        showPassword('signup');
        expect(password.getAttribute('type')).toBe('text');
    });

    it('Hide password', () => {
        let password = document.getElementById('passwordSign');
        password.setAttribute('type', 'text');
        showPassword('signup');
        expect(password.getAttribute('type')).toBe('password');

    });
});