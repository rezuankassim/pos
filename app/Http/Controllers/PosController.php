<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        return Inertia::render('Welcome');
    }
}
