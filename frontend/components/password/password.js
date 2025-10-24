document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('.btn-eye').forEach(function (btn) {
        btn.addEventListener('click', function () {
            const input = btn.parentElement.querySelector('input[type="password"], input[type="text"]');
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.querySelector('svg').setAttribute('data-icon', 'eye');
                } else {
                    input.type = 'password';
                    btn.querySelector('svg').setAttribute('data-icon', 'eye-slash');
                }
            }
        });
    });
});
