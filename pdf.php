<?php
// pdf.php - generate downloadable PDF server-side using Dompdf
// Requires: composer require dompdf/dompdf
// Place this file in project root and ensure vendor/ is present.

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo 'Method not allowed.';
    exit;
}

function get_post($k){
    return isset($_POST[$k]) ? htmlspecialchars(trim($_POST[$k]), ENT_QUOTES, 'UTF-8') : '';
}
$fullName = get_post('fullName');
$email    = get_post('email');
$phone    = get_post('phone');
$dob      = get_post('dob');
$gender   = get_post('gender');
$course   = get_post('course');

$autoload = __DIR__ . '/vendor/autoload.php';
if(!file_exists($autoload)){
    echo "<h2>Dompdf not installed</h2>";
    echo "<p>To enable PDF downloads, install Dompdf in your project folder using Composer:</p>";
    echo "<pre>composer require dompdf/dompdf</pre>";
    echo "<p>After installation retry. If you cannot use Composer, you can still use the Print button.</p>";
    exit;
}

require $autoload;

use Dompdf\Dompdf;
use Dompdf\Options;

$now = date('Y-m-d H:i');

$pdfCss = <<<CSS
body{ font-family: DejaVu Sans, Arial, sans-serif; color:#222; padding:20px; }
.header{ text-align:center; margin-bottom:18px; }
.header h1{ margin:0; font-size:20px; color:#0f62fe; }
.section{ margin-bottom:12px; }
.row{ display:flex; gap:10px; flex-wrap:wrap; }
.item{ flex:1 1 260px; border:1px solid #eee; padding:10px; border-radius:6px; background:#fbfdff; }
.item strong{ display:block; font-size:12px; color:#666; margin-bottom:6px; }
.footer{ font-size:12px; color:#666; margin-top:18px; text-align:center; }
CSS;

$pdfHtml = <<<HTML
<!doctype html>
<html>
<head>
<meta charset="utf-8"/>
<title>Application - {$fullName}</title>
<style>{$pdfCss}</style>
</head>
<body>
  <div class="header">
    <h1>Application Received</h1>
    <div>Submitted by <strong>{$fullName}</strong></div>
  </div>

  <div class="section">
    <div class="row">
      <div class="item"><strong>Full Name</strong><div>{$fullName}</div></div>
      <div class="item"><strong>Email</strong><div>{$email}</div></div>
      <div class="item"><strong>Phone</strong><div>{$phone}</div></div>
      <div class="item"><strong>Date of Birth</strong><div>{$dob}</div></div>
      <div class="item"><strong>Gender</strong><div>{$gender}</div></div>
      <div class="item"><strong>Course / Program</strong><div>{$course}</div></div>
    </div>
  </div>

  <div class="footer">This PDF was generated on {$now}</div>
</body>
</html>
HTML;

$options = new Options();
$options->set('isRemoteEnabled', false);
$dompdf = new Dompdf($options);
$dompdf->loadHtml($pdfHtml);
$dompdf->setPaper('A4', 'portrait');
$dompdf->render();

$filename = 'application_' . preg_replace('/[^A-Za-z0-9_-]/', '_', substr($fullName ?: 'submission', 0, 30)) . '.pdf';
$dompdf->stream($filename, ['Attachment' => 1]);
exit;