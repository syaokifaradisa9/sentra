<?php

namespace App\DataTransferObjects;

class BusinessDTO
{
    public function __construct(
        public string $name,
        public ?string $description = null,
        public ?int $userId = null,
    ) {}

    /**
     * Create DTO instance from application request
     */
    public static function fromAppRequest($request): self
    {
        return new self(
            name: $request->name,
            description: $request->description ?? null,
            userId: null  // Will be set in toArray method
        );
    }

    /**
     * Convert DTO to array for model creation
     */
    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'description' => $this->description,
            'user_id' => $this->userId ?? \Auth::id(),
        ];
    }
}