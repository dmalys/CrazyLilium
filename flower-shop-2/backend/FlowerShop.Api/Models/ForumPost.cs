namespace FlowerShop.Api.Models;

public class ForumPost
{
    public int Id { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? Content { get; set; }
    public ForumCategory Category { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}

public enum ForumCategory
{
    TipsAndTricks,
    News,
    Requests,
    Support
}

