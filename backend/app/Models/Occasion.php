<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Occasion extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'description',
        'icon',
        'is_active',
    ];

    protected $casts = [
        'is_active' => 'boolean',
    ];

    protected $appends = ['icon_url'];

    public function getIconUrlAttribute()
    {
        if (!$this->icon) {
            return null;
        }
        if (filter_var($this->icon, FILTER_VALIDATE_URL)) {
            return $this->icon;
        }
        return url('storage/' . $this->icon);
    }

    public function poems()
    {
        return $this->hasMany(Poem::class);
    }
}
