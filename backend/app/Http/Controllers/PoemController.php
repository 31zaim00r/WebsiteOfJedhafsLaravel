<?php

namespace App\Http\Controllers;

use App\Models\Poem;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\DB;

class PoemController extends Controller
{
    public function index(Request $request)
    {
        $query = Poem::with('occasion');

        if ($request->has('occasion_id')) {
            $query->where('occasion_id', $request->occasion_id);
        }

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('title', 'like', "%{$search}%")
                    ->orWhere('poet_name', 'like', "%{$search}%")
                    ->orWhere('content', 'like', "%{$search}%");
            });
        }

        if ($request->has('created_by')) {
            $query->where('created_by', $request->created_by);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        return response()->json($query->orderBy('created_at', 'desc')->get());
    }

    public function myPoems(Request $request)
    {
        $userId = auth()->id();
        if (!$userId) {
            return response()->json(['message' => 'Unauthorized'], 401);
        }

        $poems = Poem::with('occasion')
            ->where('created_by', $userId)
            ->orderBy('created_at', 'desc')
            ->get();

        return response()->json($poems);
    }

    public function show($id)
    {
        $poem = Poem::with('occasion')->find($id);
        if (!$poem) {
            return response()->json(['message' => 'Poem not found'], 404);
        }
        return response()->json($poem);
    }

    public function incrementViews($id)
    {
        $poem = Poem::findOrFail($id);
        $poem->increment('views_count');
        return response()->json(['views_count' => $poem->views_count]);
    }

    public function incrementDownloads($id)
    {
        $poem = Poem::findOrFail($id);
        $poem->increment('downloads_count');
        return response()->json(['downloads_count' => $poem->downloads_count]);
    }

    public function store(Request $request)
    {
        // Convert empty strings to null for nullable fields often sent by FormData
        $input = $request->all();
        if (isset($input['occasion_id']) && $input['occasion_id'] === "")
            $input['occasion_id'] = null;
        if (isset($input['category']) && $input['category'] === "")
            $input['category'] = null;
        if (isset($input['year']) && $input['year'] === "")
            $input['year'] = null;

        $validator = Validator::make($input, [
            'title' => 'required|string|max:255',
            'poet_name' => 'required|string|max:255',
            'content' => 'nullable|string',
            'occasion_id' => 'nullable|exists:occasions,id',
            'category' => 'nullable|in:وقفة,موشح,متعدد الأوزان',
            'year' => 'nullable|integer',
            'file' => 'nullable|file|max:512000', // 500MB max
            'media_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = collect($input)->only(['title', 'poet_name', 'content', 'occasion_id', 'category', 'year'])->toArray();

        // Handle media_url from either direct URL or file upload
        if ($request->hasFile('file')) {
            $path = $request->file('file')->store('poem-media', 'public');
            $data['media_url'] = asset('storage/' . $path);
        } elseif ($request->has('media_url')) {
            $data['media_url'] = $request->media_url;
        }

        $user = auth()->user();
        $isAdmin = DB::table('user_roles')->where('user_id', $user->id)->where('role', 'admin')->exists();

        if (!$isAdmin && !$user->can_upload) {
            return response()->json(['message' => 'ليس لديك صلاحية لإضافة قصائد'], 403);
        }

        $data['created_by'] = $user->id;

        $poem = Poem::create($data);

        return response()->json($poem->load('occasion'), 201);
    }

    public function update(Request $request, $id)
    {
        $poem = Poem::findOrFail($id);

        // Authorization: Only owner or admin
        $user = auth()->user();
        $isAdmin = DB::table('user_roles')->where('user_id', $user->id)->where('role', 'admin')->exists();

        if (!$isAdmin && $poem->created_by != $user->id) {
            return response()->json(['message' => 'غير مصرح لك بتعديل هذه القصيدة'], 403);
        }

        $input = $request->all();
        if (isset($input['occasion_id']) && $input['occasion_id'] === "")
            $input['occasion_id'] = null;
        if (isset($input['category']) && $input['category'] === "")
            $input['category'] = null;
        if (isset($input['year']) && $input['year'] === "")
            $input['year'] = null;

        $validator = Validator::make($input, [
            'title' => 'sometimes|string|max:255',
            'poet_name' => 'sometimes|string|max:255',
            'content' => 'nullable|string',
            'occasion_id' => 'nullable|exists:occasions,id',
            'category' => 'nullable|in:وقفة,موشح,متعدد الأوزان',
            'year' => 'nullable|integer',
            'file' => 'nullable|file|max:512000',
            'media_url' => 'nullable|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $data = $request->only(['title', 'poet_name', 'content', 'occasion_id', 'category', 'year']);

        // Handle file upload
        if ($request->hasFile('file')) {
            // Delete old file if exists in local storage
            if ($poem->media_url) {
                $storageMarker = 'storage/';
                if (strpos($poem->media_url, $storageMarker) !== false) {
                    $path = substr($poem->media_url, strpos($poem->media_url, $storageMarker) + strlen($storageMarker));
                    Storage::disk('public')->delete($path);
                }
            }

            $path = $request->file('file')->store('poem-media', 'public');
            $data['media_url'] = asset('storage/' . $path);
        } elseif ($request->has('media_url')) {
            $data['media_url'] = $request->media_url;
        }

        $poem->update($data);
        return response()->json($poem->load('occasion'));
    }

    public function destroy(Request $request, $id)
    {
        $poem = Poem::find($id);
        if (!$poem) {
            return response()->json(['message' => 'Poem not found'], 404);
        }

        // Authorization: Only owner or admin
        $user = $request->user();
        $isAdmin = DB::table('user_roles')->where('user_id', $user->id)->where('role', 'admin')->exists();

        if (!$isAdmin && $poem->created_by != $user->id) {
            return response()->json(['message' => 'غير مصرح لك بحذف هذه القصيدة'], 403);
        }

        // Delete file if exists in local storage
        if ($poem->media_url) {
            $storageMarker = 'storage/';
            if (strpos($poem->media_url, $storageMarker) !== false) {
                $path = substr($poem->media_url, strpos($poem->media_url, $storageMarker) + strlen($storageMarker));
                Storage::disk('public')->delete($path);
            }
        }

        $poem->delete();
        return response()->json(['message' => 'Poem deleted successfully']);
    }
}
