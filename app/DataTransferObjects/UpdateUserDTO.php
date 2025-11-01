<?php

namespace App\DataTransferObjects;
<<<<<<< HEAD
=======

use App\Http\Requests\Auth\UpdateProfileRequest;
>>>>>>> a0348dfc2fe0e882570c33f61e458ee154579607

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

    public static function fromAppRequest(UpdateProfileRequest $request): self
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