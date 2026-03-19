<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class UploadController extends Controller
{
    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'file'   => 'required|file|max:10240|mimes:jpg,jpeg,png,gif,webp,svg,pdf',
            'folder' => 'nullable|string|max:100',
        ]);

        $folder   = $request->input('folder', 'uploads');
        $file     = $request->file('file');
        $filename = Str::uuid() . '.' . $file->getClientOriginalExtension();
        $path     = $file->storeAs($folder, $filename, 'public');
        $url      = Storage::disk('public')->url($path);

        return response()->json([
            'data'    => ['url' => $url, 'path' => $path, 'filename' => $filename],
            'message' => 'File uploaded.',
        ]);
    }
}
