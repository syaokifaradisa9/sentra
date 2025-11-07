<?php

namespace App\DataTransferObjects;

use App\Http\Requests\EmployeeRequest;

class EmployeeDTO
{
    public function __construct(
        public string $name,
        public string $email,
        public string $password,
        public string $phone,
        public string $address,
        public string $position,
        public ?int $businessId = null,
        public array $branchIds = [],
    ) {}

    public static function fromAppRequest(EmployeeRequest $request): self
    {
        $validated = $request->validated();

        return new self(
            name: $validated['name'],
            email: $validated['email'],
            password: $validated['password'] ?? '',
            phone: $validated['phone'],
            address: $validated['address'],
            position: $validated['position'],
            businessId: isset($validated['business_id']) ? (int) $validated['business_id'] : null,
            branchIds: $validated['branch_ids'] ?? [],
        );
    }

    public function toArray(): array
    {
        return [
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'address' => $this->address,
            'position' => $this->position,
        ];
    }

    public function toArrayWithPassword(): array
    {
        $data = $this->toArray();
        if (!empty($this->password)) {
            $data['password'] = $this->password;
        }
        return $data;
    }
}
