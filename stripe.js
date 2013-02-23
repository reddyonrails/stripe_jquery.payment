var publicStripeApiKeyTesting = '...';

Stripe.setPublishableKey(publicStripeApiKeyTesting);
$(function() {
function stripeResponseHandler (status, response) {
    if (response.error) {
        $('#error').text(response.error.message);
        $('#error').slideDown(300);
        $('#stripe-form .submit-button').removeAttr("disabled");
        return;
    }

    var form = $("#payment-form");
    form.append("<input type='hidden' name='stripe_token' value='" + response.id + "'/>");

    $.post(
        form.attr('action'),
        form.serialize(),
        function (status) {
            if (status != 'ok') {
                $('#error').text(status);
                $('#error').slideDown(300);
            }
            else {
                $('#error').hide();
                $('#success').slideDown(300);
            }
            $('.submit-button').removeAttr("disabled");
        }
    );
}

$('[data-numeric]').payment('restrictNumeric');
$('.cc-number').payment('formatCardNumber');
$('.cc-exp').payment('formatCardExpiry');
$('.cc-cvc').payment('formatCardCVC');

$('#payment-form').submit(function(e){
    e.preventDefault();
    $('input').removeClass('invalid');
    $('.validation').removeClass('passed failed');

    var cardType = $.payment.cardType($('.cc-number').val());

    $('.cc-number').toggleClass('invalid', !$.payment.validateCardNumber($('.cc-number').val()));
    $('.cc-exp').toggleClass('invalid', !$.payment.validateCardExpiry($('.cc-exp').payment('cardExpiryVal')));
    $('.cc-cvc').toggleClass('invalid', !$.payment.validateCardCVC($('.cc-cvc').val(), cardType));

    if ( $('input.invalid').length ) {
        $('.validation').addClass('failed');
    } else {
        $('.validation').addClass('passed');
        $('#error').hide();
        // disable the submit button to prevent repeated clicks
        $('.submit-button').attr("disabled", "disabled");

        var amount = $('#cc-amount').val(); // amount you want to charge in cents
        Stripe.createToken({
            number: $('.cc-number').val(),
            cvc: $('.cc-cvc').val(),
            exp_month: $('.cc-exp').val().split("/")[0].trim(),
            exp_year: $('.cc-exp').val().split("/")[1].trim()
        }, stripeResponseHandler);

        // prevent the form from submitting with the default action

        return false;
    }
});
});
