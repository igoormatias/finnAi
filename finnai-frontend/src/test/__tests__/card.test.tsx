import { render, screen } from "@testing-library/react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

describe("Card", () => {
  it("renders header/content", () => {
    render(
      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>Conteúdo</CardContent>
      </Card>
    );

    expect(screen.getByText("Resumo")).toBeInTheDocument();
    expect(screen.getByText("Conteúdo")).toBeInTheDocument();
  });
});

