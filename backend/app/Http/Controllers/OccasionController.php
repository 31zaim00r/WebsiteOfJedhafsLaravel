<?php

namespace App\Http\Controllers;

use App\Models\Occasion;
use Illuminate\Http\Request;

class OccasionController extends Controller
{
    public function index()
    {
        $occasions = Occasion::where('is_active', true)->get();
        return response()->json($occasions);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|file|image|max:2048',
            'is_active' => 'boolean'
        ]);

        if ($request->hasFile('icon')) {
            $path = $request->file('icon')->store('occasions', 'public');
            $validated['icon'] = $path;
        }

        $occasion = Occasion::create($validated);
        return response()->json($occasion, 201);
    }

    public function update(Request $request, $id)
    {
        $occasion = Occasion::find($id);
        if (!$occasion) {
            return response()->json(['message' => 'Occasion not found'], 404);
        }

        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'icon' => 'nullable|file|image|max:2048',
            'is_active' => 'boolean'
        ]);

        if ($request->hasFile('icon')) {
            // Delete old icon if it exists and is a file
            if ($occasion->icon && !\Illuminate\Support\Str::contains($occasion->icon, 'http')) {
                \Illuminate\Support\Facades\Storage::disk('public')->delete($occasion->icon);
            }
            $path = $request->file('icon')->store('occasions', 'public');
            $validated['icon'] = $path;
        }

        $occasion->update($validated);
        return response()->json($occasion);
    }

    public function destroy($id)
    {
        $occasion = Occasion::find($id);
        if (!$occasion) {
            return response()->json(['message' => 'Occasion not found'], 404);
        }

        $occasion->delete();
        return response()->json(['message' => 'Occasion deleted']);
    }
}
