<?php

ini_set('display_errors', '1');
ini_set('display_startup_errors', '1');
error_reporting(E_ALL);

chdir(__DIR__.'/../');

echo "\nAktueller Status";
system("git status;pwd");

echo "Disable Filemode and Lineendings\n";
system("git config core.fileMode false");
system("git config core.autocrlf true");

echo "\n\nGit Changelog\n";
// Pull current branch
//$cmd = "git pull " . escapeshellarg($_GET['url']) . " ".escapeshellarg ($_GET['branch'])." --ff-only 2>&1";
$cmd = "git pull";
print_r($cmd);
exec($cmd, $output, $status);

print_r($output);

echo "\nRESULT: ".$status."\n";
exit($status);
