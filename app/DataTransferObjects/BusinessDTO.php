<?php

namespace App\DataTransferObjects;

use App\Http\Requests\BusinessRequest;
use Illuminate\Support\Facades\Auth;

class BusinessDTO
{
    public function __construct(
        public int $userId,
        public string $name,
        public string $description
    ) {}

    public static function fromAppRequest(BusinessRequest $request): self
    {
        return new self(
            userId: $request->user_id ?? Auth::user()->id,
            name: $request->name,
            description: $request->description
        );
    }

    public function toArray(): array
    {
        return [
            'user_id' => $this->userId,
            'name' => $this->name,
            'description' => $this->description,
        ];
    }
}
