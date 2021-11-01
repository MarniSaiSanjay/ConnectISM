// Example starter JavaScript for disabling form submissions if there are invalid fields
(function () {
    'use strict'
    // bsCustomFileInput.init() // to use bs-custom-file-input we should use run this line once when we use the app
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    var forms = document.querySelectorAll('.needs-validation')     // this class must be the class of form/s

    // Loop over them and prevent submission
    Array.prototype.slice.call(forms)    // we can make array usning 'from' instead of '.prototype.slice.call' i.e. 'Array.from(forms)'
        .forEach(function (form) {
            form.addEventListener('submit', function (event) {
                if (!form.checkValidity()) {
                    event.preventDefault()
                    event.stopPropagation()
                }
                form.classList.add('was-validated')
            }, false)
        })
})()