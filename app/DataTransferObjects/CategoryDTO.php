<?php

namespace App\DataTransferObjects;

use App\Http\Requests\CategoryRequest;

class CategoryDTO
{
    public function __construct(
        public string $name,
        public array $branchIds = [],
    ) {}

    public static function fromAppRequest(CategoryRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            name: $validated['name'],
            branchIds: $validated['branch_ids'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
        ];
    }
}
