<?php

namespace App\DTO;

class UpdateUserDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public ?string $phone = null,
        public ?string $address = null,
        public ?string $position = null
    ) {
    }

    public static function fromAppRequest(\Illuminate\Http\Request $request): self
    {
        return new self(
            name: $request->name,
            email: $request->email,
            phone: $request->phone,
            address: $request->address,
            position: $request->position
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'position' => $this->position
        ];
    }
}