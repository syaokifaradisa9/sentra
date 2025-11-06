<?php

namespace App\DataTransferObjects;

use App\Http\Requests\BranchRequest;
use Illuminate\Support\Facades\Auth;

class BranchDTO
{
    public function __construct(
        public int $businessId,
        public int $userId,
        public string $name,
        public string $address,
        public string $openingTime,
        public string $closingTime
    ) {}

    public static function fromAppRequest(BranchRequest $request): self
    {
        $validated = $request->validated();
        $userId = $request->user()?->id ?? Auth::id();

        return new self(
            businessId: (int) $validated['business_id'],
            userId: (int) $userId,
            name: $validated['name'],
            address: $validated['address'],
            openingTime: $validated['opening_time'],
            closingTime: $validated['closing_time']
        );
    }

    public function toArray(): array
    {
        return [
            'business_id' => $this->businessId,
            'owner_id' => $this->userId,
            'name' => $this->name,
            'address' => $this->address,
            'opening_time' => $this->openingTime,
            'closing_time' => $this->closingTime,
        ];
    }
}
