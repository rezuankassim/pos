<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index()
    {
        $order = Order::query()
            ->where('status', 'pending')
            ->first();
        $items = [];

        if ($order) {
            $items = $order->orderItems
                ->map(function ($item) {
                    return [
                        'product_id' => $item->product_id,
                        'product_name' => $item->product_name,
                        'product_price' => (int) $item->cost_per_item,
                        'quantity' => (int) $item->quantity,
                        'cost' => $item->cost_per_item * $item->quantity,
                    ];
                });
        }
        
        return Inertia::render('Welcome', [
            'startOrderId' => optional($order)->id,
            'startItems' => $items,
        ]);
    }
}
