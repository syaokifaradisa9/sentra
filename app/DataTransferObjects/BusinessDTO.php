<?php

namespace App\DataTransferObjects;

use App\Http\Requests\BusinessRequest;
use Illuminate\Support\Facades\Auth;

class BusinessDTO
{
    public function __construct(
        public int $userId,
        public string $name,
        public ?string $description = null,
    ) {}

    public static function fromAppRequest(BusinessRequest $request): self
    {
        $validated = $request->validated();
        $userId = $request->user()?->id ?? Auth::id();

        return new self(
            userId: (int) $userId,
            name: $validated['name'],
            description: $validated['description'] ?? null,
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

