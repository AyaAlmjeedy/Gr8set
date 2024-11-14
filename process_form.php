<?php

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);


// إعدادات الاتصال بقاعدة البيانات
$servername = "localhost";  // خادم MySQL
$username = "root";         // اسم المستخدم
$password = "";             // كلمة المرور (اتركها فارغة في XAMPP)
$dbname = "contact_form_db"; // اسم قاعدة البيانات

// إنشاء الاتصال بقاعدة البيانات
$conn = new mysqli($servername, $username, $password, $dbname);

// التحقق من الاتصال
if ($conn->connect_error) {
    die("Connection failed: " . $conn->connect_error);
}

// التحقق من استقبال البيانات من النموذج
if ($_SERVER["REQUEST_METHOD"] == "POST") {

    echo "<pre>";
    var_dump($_POST);
    echo "</pre>";
    die();  // إيقاف الكود مؤقتًا للتحقق من البيانات

    // استلام البيانات من النموذج باستخدام الأسماء الموجودة في الحقول
    $name = $_POST['data']['ContactForm']['name'];
    $email = $_POST['data']['ContactForm']['email'];
    $phone = $_POST['data']['ContactForm']['phone'];
    $message = $_POST['data']['ContactForm']['message'];

    // التحقق من أن جميع الحقول المطلوبة مملوءة
    if (!empty($name) && !empty($email) && !empty($message)) {
        // إعداد استعلام SQL لإدخال البيانات في الجدول
        $sql = "INSERT INTO contact_form_data (name, email, phone, message) VALUES (?, ?, ?, ?)";

        // تجهيز الاستعلام
        $stmt = $conn->prepare($sql);
        if ($stmt === false) {
            die('Prepare failed: ' . $conn->error);
        }

        // ربط القيم مع الاستعلام
        $stmt->bind_param("ssss", $name, $email, $phone, $message);

        // تنفيذ الاستعلام والتحقق من نجاحه
        if ($stmt->execute()) {
            echo "Data inserted successfully!";
        } else {
            echo "Error: " . $stmt->error;
        }

        // إغلاق الاتصال
        $stmt->close();
    } else {
        echo "Please fill out all required fields.";
    }
}

// إغلاق الاتصال بقاعدة البيانات
$conn->close();
?>
