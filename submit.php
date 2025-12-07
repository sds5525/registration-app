<?php
header('Content-Type: text/html; charset=utf-8');

/* Simple server-side processing and sanitization.
   Expects: fullName, email, phone, dob, gender, course, agree
*/

function get_post($k){
  return isset($_POST[$k]) ? htmlspecialchars(trim($_POST[$k]), ENT_QUOTES, 'UTF-8') : '';
}

$fullName = get_post('fullName');
$email    = get_post('email');
$phone    = get_post('phone');
$dob      = get_post('dob');
$gender   = get_post('gender');
$course   = get_post('course');
$agree    = get_post('agree');

$errors = [];
if($fullName === '') $errors[] = 'Full name is required.';
if($email === '') $errors[] = 'Email is required.';
if($phone === '') $errors[] = 'Phone is required.';
if($agree !== 'yes') $errors[] = 'Confirmation checkbox not checked.';

if(!empty($errors)){
  echo '<div class="result-card"><h2>Submission error</h2><ul style="color:#c0392b">';
  foreach($errors as $e){
    echo '<li>'. $e .'</li>';
  }
  echo '</ul><p>Please go back and correct the errors.</p></div>';
  exit;
}
?>
<div class="result-card" role="status" aria-live="polite">
  <h2>Application Received</h2>
  <p>Thank you <strong><?php echo $fullName; ?></strong>. Below is the formatted information you submitted:</p>

  <div class="result-row">
    <div class="result-item">
      <strong>Full Name</strong>
      <div><?php echo $fullName; ?></div>
    </div>

    <div class="result-item">
      <strong>Email</strong>
      <div><?php echo $email; ?></div>
    </div>

    <div class="result-item">
      <strong>Phone</strong>
      <div><?php echo $phone; ?></div>
    </div>

    <div class="result-item">
      <strong>Date of Birth</strong>
      <div><?php echo $dob ?: '—'; ?></div>
    </div>

    <div class="result-item">
      <strong>Gender</strong>
      <div><?php echo $gender ?: '—'; ?></div>
    </div>

    <div class="result-item">
      <strong>Course / Program</strong>
      <div><?php echo $course ?: '—'; ?></div>
    </div>
  </div>

  <div class="print-area">
    <button id="printBtn" class="print-btn">Print / Save as PDF</button>

    <span style="color:var(--muted); margin-left:10px; display:inline-block">Use the Print button to save or print this summary.</span>
  </div>
</div>