<?php
/**
 * Created by PhpStorm.
 * Author: Philip Maaß
 * Date: 22.04.22
 * Time: 20:15
 * License
 */

namespace Rollguys\Rollone\App\Service;

class Random
{
    /**
     * Fetches a random number for using as a seed from an external source.
     *
     * @return int
     */
    public static function getSeed() : int
    {

        return intval(bcmod(base_convert(md5(file_get_contents("https://sdo.gsfc.nasa.gov/assets/img/latest/latest_4096_0171.jpg")),16,10), PHP_INT_MAX ));
    }
}