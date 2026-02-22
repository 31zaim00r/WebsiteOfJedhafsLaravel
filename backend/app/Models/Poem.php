<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Poem extends Model
{
    use HasFactory;

    protected $fillable = [
        'title',
        'content',
        'poet_name',
        'year',
        'media_url',
        'occasion_id',
        'category',
        'created_by',
        'views_count',
        'downloads_count',
    ];

    protected $casts = [
        'year' => 'integer',
        'views_count' => 'integer',
        'downloads_count' => 'integer',
    ];

    public function occasion()
    {
        return $this->belongsTo(Occasion::class);
    }

    public function creator()
    {
        return $this->belongsTo(User::class, 'created_by');
    }
}
