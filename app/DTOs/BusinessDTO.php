<?php

namespace App\DTOs;

use App\Http\Requests\BusinessRequest;
use Illuminate\Support\Facades\Auth;

class BusinessDTO
{
    public function __construct(
        public int $user_id,
        public string $name,
        public string $description
    ) {}

    public static function fromAppRequest(BusinessRequest $data): self
    {
        return new self(
            user_id: $data['user_id'] ?? Auth::user()->id, // Get authenticated user ID directly
            name: $data['name'],
            description: $data['description']
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->user_id,
            'name' => $this->name,
            'description' => $this->description,
        ];
    }
}
