<?php

namespace App\DataTransferObjects;

use App\Http\Requests\ProductRequest;
use Illuminate\Http\UploadedFile;

class ProductDTO
{
    public function __construct(
        public string $name,
        public int $categoryId,
        public float $price,
        public ?string $description = null,
        public array $branchIds = [],
        public ?UploadedFile $photo = null,
    ) {}

    public static function fromAppRequest(ProductRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            name: $validated['name'],
            categoryId: (int) $validated['category_id'],
            price: (float) $validated['price'],
            description: $validated['description'] ?? null,
            branchIds: $validated['branch_ids'] ?? [],
            photo: $request->file('photo')
        );
    }

    public function toArray(?string $photoPath = null): array
    {
        return [
            'name' => $this->name,
            'category_id' => $this->categoryId,
            'price' => $this->price,
            'description' => $this->description,
            'photo' => $photoPath,
        ];
    }
}

