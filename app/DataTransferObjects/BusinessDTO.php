<?php

namespace App\DataTransferObjects;

use App\Http\Requests\BusinessRequest;

class BusinessDTO
{
    public function __construct(
        public int $userId,
        public string $name,
        public ?string $description = null,
    ) {}

    public static function fromAppRequest(BusinessRequest $request, int $userId): self
    {
        $validated = $request->validated();

        return new self(
            userId: (int) $userId,
            name: $validated['name'],
            description: $validated['description'] ?? null,
        );
    }

    public function toArray(): array
    {
        return [
            'owner_id' => $this->userId,
            'name' => $this->name,
            'description' => $this->description,
        ];
    }
}
