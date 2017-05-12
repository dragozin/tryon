<?
$uploaddir = dirname(__FILE__).'/content/upload/';
$uploadfile = $uploaddir . basename($_FILES['afile']['name']);
if (move_uploaded_file($_FILES['afile']['tmp_name'], $uploadfile)) {
    echo '/verstka/try-on/content/upload/'.$_FILES['afile']['name'];
} else {

}
