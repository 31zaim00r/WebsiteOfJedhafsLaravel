<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UserController extends Controller
{
    public function index()
    {
        $users = User::all();
        $usersWithRoles = $users->map(function ($user) {
            $roleData = DB::table('user_roles')->where('user_id', $user->id)->first();
            $user->role = $roleData ? $roleData->role : 'user';
            return $user;
        });

        return response()->json($usersWithRoles);
    }

    public function updateProfile(Request $request, $id)
    {
        $user = User::findOrFail($id);

        // Authorization: Only user themselves or an admin
        $authenticatedUser = auth()->user();
        $isAdmin = DB::table('user_roles')->where('user_id', $authenticatedUser->id)->where('role', 'admin')->exists();

        if (!$isAdmin && $authenticatedUser->id != $user->id) {
            return response()->json(['message' => 'Unauthorized'], 403);
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'phone_number' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:6|confirmed',
        ]);

        $data = [
            'name' => $request->name,
            'phone_number' => $request->phone_number,
        ];

        if ($request->filled('password')) {
            $data['password'] = bcrypt($request->password);
        }

        $user->update($data);

        return response()->json($user);
    }

    public function updateRole(Request $request, $id)
    {
        $request->validate([
            'role' => 'required|in:admin,user',
        ]);

        $user = User::findOrFail($id);

        DB::table('user_roles')->updateOrInsert(
            ['user_id' => $user->id],
            ['role' => $request->role, 'updated_at' => now()]
        );

        return response()->json(['message' => 'تم تحديث الصلاحية بنجاح']);
    }

    public function toggleUpload(Request $request, $id)
    {
        $request->validate([
            'can_upload' => 'required|boolean',
        ]);

        $user = User::findOrFail($id);
        $user->update(['can_upload' => $request->can_upload]);

        return response()->json(['message' => 'تم تحديث صلاحية الرفع بنجاح']);
    }

    public function destroy($id)
    {
        $user = User::findOrFail($id);
        $user->delete();

        return response()->json(['message' => 'تم حذف المستخدم بنجاح']);
    }
}
