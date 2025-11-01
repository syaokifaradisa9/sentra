<?php

namespace App\DataTransferObjects;

<<<<<<< HEAD
=======
use App\Http\Requests\BranchRequest;
>>>>>>> a0348dfc2fe0e882570c33f61e458ee154579607
use Illuminate\Support\Facades\Auth;

class BranchDTO
{
    public function __construct(
<<<<<<< HEAD
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
=======
        public int $businessId,
        public int $userId,
        public string $name,
        public string $address,
        public string $openingTime,
        public string $closingTime
    ) {}

    public static function fromAppRequest(BranchRequest $request): self
    {
        return new self(
            businessId: $request->business_id,
            userId: $request->user_id ?? Auth::user()->id,
            name: $request->name,
            address: $request->address,
            openingTime: $request->opening_time,
            closingTime: $request->closing_time
>>>>>>> a0348dfc2fe0e882570c33f61e458ee154579607
        );
    }

    public function toArray(): array
    {
        return [
<<<<<<< HEAD
            'business_id' => $this->business_id,
            'user_id' => $this->user_id,
            'name' => $this->name,
            'address' => $this->address,
            'opening_time' => $this->opening_time,
            'closing_time' => $this->closing_time,
        ];
    }
}
=======
            'business_id' => $this->businessId,
            'user_id' => $this->userId,
            'name' => $this->name,
            'address' => $this->address,
            'opening_time' => $this->openingTime,
            'closing_time' => $this->closingTime,
        ];
    }
}
>>>>>>> a0348dfc2fe0e882570c33f61e458ee154579607
