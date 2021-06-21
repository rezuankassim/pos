<?php

namespace App\Http\Controllers;

use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class OrderController extends Controller
{
    public function store(Request $request)
    {
        $validated = $request->validate([
            'orderId' => ['nullable', Rule::exists(Order::class, 'id')],
            'product_id' => 'required',
            'product_name' => 'required',
            'product_price' => ['required', 'numeric'],
        ]);

        if ($validated['orderId']) {
            $order = Order::find($validated['orderId']);
            
            $order->orderItems()->create([
                'cost_per_item' => $validated['product_price'],
                'product_id' => $validated['product_id'],
                'product_name' => $validated['product_name'],
                'quantity' => 1
            ]);

            $total = $order->orderItems->reduce(function ($total, $item) {
                return $total + ($item->quantity * $item->cost_per_item);
            }, 0);

            $order->update([
                'total_amount_cents' => $total,
                'tax' => $total * 1.06,
            ]);
        } else {
            $order = Order::create([
                'status' => 'pending',
                'total_amount_cents' => $validated['product_price'], 
            ]);

            $order->orderItems()->create([
                'cost_per_item' => $validated['product_price'],
                'product_id' => $validated['product_id'],
                'product_name' => $validated['product_name'],
                'quantity' => 1
            ]);
        }

        return response([
            'status' => 'Success',
            'orderId' => $order->id,
        ]);
    }

    public function add(Request $request, Order $order)
    {
        $validated = $request->validate([
            'product_name' => 'required',
        ]);

        $item = $order->orderItems()
            ->where('product_name', $validated['product_name'])
            ->firstOrFail();
        
        $item->update([
            'quantity' => $item->quantity + 1,
        ]);

        $total = $order->orderItems->reduce(function ($total, $item) {
            return $total + ($item->quantity * $item->cost_per_item);
        }, 0);

        $order->update([
            'total_amount_cents' => $total,
            'tax' => $total * 1.06,
        ]);

        return response([
            'status' => 'Success',
        ]);
    }

    public function remove(Request $request, Order $order)
    {
        $validated = $request->validate([
            'product_name' => 'required',
        ]);

        $item = $order->orderItems()
            ->where('product_name', $validated['product_name'])
            ->firstOrFail();

        if ($item->quantity == 1) {
            // $item->delete();
        } else {
            $item->update([
                'quantity' => $item->quantity - 1,
            ]);
        }

        $total = $order->orderItems->reduce(function ($total, $item) {
            return $total + ($item->quantity * $item->cost_per_item);
        }, 0);

        $order->update([
            'total_amount_cents' => $total,
            'tax' => $total * 1.06,
        ]);

        return response([
            'status' => 'Success',
        ]);
    }

    public function checkout(Request $request, Order $order)
    {
        $validated = $request->validate([
            'paid_amount' => ['required', 'numeric'],
        ]);

        if ($validated['paid_amount'] < $order->total_amount) {
            return response([
                'status' => 'Error'
            ], 400);
        }

        $order->update([
            'status' => 'completed',
        ]);

        $order->transaction()->create([
            'status' => 'paid',
            'payment_method' => 'cash',
            'paid_amount_cents' => $validated['paid_amount'],
        ]);

        return response([
            'status' => 'Success',
        ]);
    }

    public function cancel(Order $order)
    {
        $order->update([
            'status' => 'cancelled',
        ]);

        return response([
            'status' => 'Success',
        ]);
    }
}
