// script.js - validation, submission logic, and Clear form handler
$(function(){
  // helper functions
  function showError(fieldName, message){
    $('.error[data-for="'+fieldName+'"]').text(message || '');
  }
  function clearErrors(){
    $('.error').text('');
  }

  // SUBMIT handler
  $('#regForm').on('submit', function(ev){
    ev.preventDefault();
    clearErrors();

    var data = {
      fullName: $.trim($('#fullName').val()),
      email: $.trim($('#email').val()),
      phone: $.trim($('#phone').val()),
      dob: $('#dob').val(),
      gender: $('#gender').val() || '',
      course: $.trim($('#course').val()),
      agree: $('#agree').is(':checked') ? 'yes' : ''
    };

    // Client-side validation
    var ok = true;
    if(!data.fullName){
      showError('fullName','Full name is required.');
      ok = false;
    }
    if(!data.email){
      showError('email','Email is required.');
      ok = false;
    } else {
      var eRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if(!eRe.test(data.email)){
        showError('email','Enter a valid email.');
        ok = false;
      }
    }
    if(!data.phone){
      showError('phone','Phone is required.');
      ok = false;
    } else {
      var pRe = /^[0-9+\-\s()]{6,20}$/;
      if(!pRe.test(data.phone)){
        showError('phone','Enter a valid phone number.');
        ok = false;
      }
    }
    if(!data.agree){
      showError('agree','You must confirm the information.');
      ok = false;
    }

    if(!ok) return;

    $('#submitBtn').prop('disabled', true).text('Submitting...');

    $.post('submit.php', data, function(response){
      // inject server HTML (server returns .result-card HTML)
      $('#resultArea').html(response);
      // animate / scroll to result
      $('html, body').animate({ scrollTop: $('#resultArea').offset().top - 10 }, 500);
    }).fail(function(){
      $('#resultArea').html('<div class="result-card"><strong>Error:</strong> Could not submit. Try again.</div>');
    }).always(function(){
      $('#submitBtn').prop('disabled', false).text('Submit Application');
    });
  });

  // CLEAR form handler
  $('#clearBtn').on('click', function(){
    // Reset form fields
    var form = $('#regForm')[0];
    if(form){
      form.reset();
    }

    // Clear validation errors
    clearErrors();

    // Re-enable submit button and reset its label
    $('#submitBtn').prop('disabled', false).text('Submit Application');

    // Clear result area (remove server response)
    $('#resultArea').html('<div class="placeholder"><svg width="72" height="72" viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false"><path d="M3 7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7z" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"/><path d="M8 11l2.5 3L16 8" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" opacity="0.18"/></svg><p class="placeholder__text">Submission results will appear here after you press Submit. Use the Print button to save as PDF.</p></div>');

    // Scroll back to the form and focus first field
    $('html, body').animate({ scrollTop: $('#regForm').offset().top - 20 }, 300, function(){
      $('#fullName').focus();
    });
  });

  // Delegated handler: print button from server response
  $('#resultArea').on('click', '#printBtn', function(){
    window.print();
  });
});