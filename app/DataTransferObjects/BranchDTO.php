<?php

namespace App\DataTransferObjects;

use Illuminate\Support\Facades\Auth;

class BranchDTO
{
    public function __construct(
        public int $business_id,
        public int $user_id,
        public string $name,
        public string $address,
        public string $opening_time,
        public string $closing_time
    ) {}

    public static function fromAppRequest(array $data): self
    {
        return new self(
            business_id: $data['business_id'],
            user_id: $data['user_id'] ?? Auth::user()->id, // Get authenticated user ID directly
            name: $data['name'],
            address: $data['address'],
            opening_time: $data['opening_time'],
            closing_time: $data['closing_time']
        );
    }

    public function toArray(): array
    {
        return [
            'business_id' => $this->business_id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'address' => $this->address,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
        ];
    }
}