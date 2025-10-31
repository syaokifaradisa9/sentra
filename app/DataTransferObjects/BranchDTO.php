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
        return new self(
            businessId: $request->business_id,
            userId: $request->user_id ?? Auth::user()->id,
            name: $request->name,
            address: $request->address,
            openingTime: $request->opening_time,
            closingTime: $request->closing_time
        );
    }

    public function toArray(): array
    {
        return [
            'business_id' => $this->businessId,
            'user_id' => $this->userId,
            'name' => $this->name,
            'address' => $this->address,
            'opening_time' => $this->openingTime,
            'closing_time' => $this->closingTime,
        ];
    }
}
