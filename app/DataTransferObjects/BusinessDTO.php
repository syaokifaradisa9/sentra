<?php

namespace App\DataTransferObjects;

<<<<<<< HEAD
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
=======
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
>>>>>>> a0348dfc2fe0e882570c33f61e458ee154579607
